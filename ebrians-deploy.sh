docker build -t sim-launcher-ebrains --build-arg BUILD_MODE=production -f Dockerfile .
docker tag sim-launcher-ebrains:latest antonelepfl/simulation-launcher:ebrains
docker push antonelepfl/simulation-launcher