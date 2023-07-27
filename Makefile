
IMAGE_FRONTEND:=simulation-launcher-ui
REGISTRY:=docker-registry-default.ocp.bbp.epfl.ch/bbp-ou-nse

DEV_TAG:=mooc-bbp-dev
PROD_TAG:=mooc-bbp

define HELPTEXT
Makefile usage - Targets:
  run_dev            Run development instance of the frontend.
  docker_build_prod  Create PROD frontend project
  docker_build_dev   Create DEV frontend project
  docker_login       Ask for credentials OC and Docker
  docker_push_dev    Push DEV frontend image
  docker_push_prod   Push PROD frontend image
endef
export HELPTEXT

help:
	@echo "$$HELPTEXT"

docker_build_dev:
	@echo 'Building DEV frontend...'
	@echo $(IMAGE_FRONTEND)
	docker build --build-arg BUILD_MODE='development' -t $(IMAGE_FRONTEND):$(DEV_TAG) .

docker_build_prod:
	@echo 'Building PROD frontend...'
	@echo $(IMAGE_FRONTEND)
	docker build --build-arg BUILD_MODE='production' -t $(IMAGE_FRONTEND):$(PROD_TAG) .

docker_login:
	oc login https://ocp.bbp.epfl.ch:8443
	oc project 'bbp-ou-nse'
	docker login -p $$(oc whoami -t) -u unused docker-registry-default.ocp.bbp.epfl.ch

docker_push_dev: | docker_build_dev
	@echo 'Pushing DEV frontend...'
	docker tag $(IMAGE_FRONTEND):$(DEV_TAG) $(REGISTRY)/$(IMAGE_FRONTEND):$(DEV_TAG)
	docker push $(REGISTRY)/$(IMAGE_FRONTEND):$(DEV_TAG)

docker_push_prod: | docker_build_prod
	@echo 'Pushing PROD frontend...'
	docker tag $(IMAGE_FRONTEND):$(PROD_TAG) $(REGISTRY)/$(IMAGE_FRONTEND):$(PROD_TAG)
	docker push $(REGISTRY)/$(IMAGE_FRONTEND):$(PROD_TAG)

run_dev:
	npm run dev
