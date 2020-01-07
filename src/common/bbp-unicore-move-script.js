
export const copyToDestinationScript = [
  'FOLDER_UUID=$(basename $(pwd))',
  'DESTINATION_FOLDER="/gpfs/bbp.cscs.ch/project/<%= projSelected %>/scratch/unicore/$FOLDER_UUID/"',
  'mkdir -p $DESTINATION_FOLDER',
  'echo Destination Folder: $DESTINATION_FOLDER',
  'ln -s $DESTINATION_FOLDER processing_at',
  'to_copy=$(find . | grep -vE "std*|bss*|UNICORE|processing_at")',
  'cp $to_copy $DESTINATION_FOLDER',
  'pushd $DESTINATION_FOLDER',
];

export const copyFromDestinationScript = [
  'popd',
  'mv std* $DESTINATION_FOLDER',
  'ln -sf $DESTINATION_FOLDER/* .',
];

export default {};
