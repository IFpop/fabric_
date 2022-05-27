cd ../first-network
echo 'first-network'
./byfn.sh down

cd ../rup
echo 'rup'
rm -rf ./javascript/wallet/* 
y

a=$(docker ps -aq)
for i in ${a[@]}
do
        if [ "$i" == "e51b3f6f069d" ]
        then
                echo 'jd1'
        else
                docker stop $i
                docker rm $i
        fi
done
