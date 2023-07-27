
### Build

IMG='sim-launcher'
TAG='ebrains'

docker build -t $IMG:$TAG -f Dockerfile.prod .

EBRAINS_REGISTRY='docker-registry.ebrains.eu/bsp-epfl'

echo 'TAG' $EBRAINS_REGISTRY/$IMG:$TAG
docker tag $IMG:$TAG $EBRAINS_REGISTRY/$IMG:$TAG

echo 'PUSH' $EBRAINS_REGISTRY/$IMG:$TAG
docker push $EBRAINS_REGISTRY/$IMG:$TAG
