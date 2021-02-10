export interface Temperatures {
  bed: Temperature;
  tool0: Temperature;
}

interface Temperature {
  current: number;
  set: number;
}
