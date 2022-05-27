package main

import (
	"encoding/json"
	"fmt"
	"sort"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

type R struct {
	Routerlist []string
}

func in(target string, str_array []string) bool {
	sort.Strings(str_array)
	index := sort.SearchStrings(str_array, target)
	if index < len(str_array) && str_array[index] == target {
		return true
	}
	return false
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "queryLine" {
		return s.queryLine(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "createLine" {
		return s.createLine(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) queryLine(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	carAsBytes, _ := APIstub.GetState(args[0])

	return shim.Success(carAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) createLine(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}
	// 先判断能否在原来的数据库中找到
	contentAsBytes, err := APIstub.GetState(args[0])
	if err != nil { //没有找到，则新建一个
		temp := new(R)
		temp.Routerlist = append(temp.Routerlist, args[1])
		aAsBytes, _ := json.Marshal(temp)
		APIstub.PutState(args[0], aAsBytes)
	} else { //找到了,看是否重复
		r := new(R)
		_ = json.Unmarshal(contentAsBytes, &r)
		if in(args[1], r.Routerlist) == false { //不存在才加入
			r.Routerlist = append(r.Routerlist, args[1])
			bAsBytes, _ := json.Marshal(r)
			APIstub.PutState(args[0], bAsBytes)
		}
	}
	return shim.Success(nil)
}

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
