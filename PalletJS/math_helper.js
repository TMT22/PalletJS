// Math helper functions

function isNum(value) {
    return typeof value === 'number';
  }
  
  class Mat {
    constructor(n, m){
      if(n < 1 || m < 1 || !Number.isInteger(n) || !Number.isInteger(m)) {
        throw new Error('Invalid size for a matrix!');
      }
  
      this.n = n;
      this.m = m;
  
      this._M = Array(n).fill(0).map(x => Array(m).fill(0))
    }
  
    plus(other){
      if(other instanceof Mat){
        if(this.n != other.n || this.m != other.m){
          throw new Error('Other does not match required dimension!');
        }
        
        let result = new Mat(this.n, this.m);
  
        for (let r = 0; r < this.n; r++) {
          for (let c = 0; c < this.m; c++) {
            result._M[r][c] = this._M[r][c] + other._M[r][c];
          }
        }
  
        return result;
  
      }
      else if(isNum(other)) {
        let result = new Mat(this.n, this.m);
  
        for (let r = 0; r < this.n; r++) {
          for (let c = 0; c < this.m; c++) {
            result._M[r][c] = this._M[r][c] + other;
          }
        }
  
        return result;
      }
  
      throw new Error('Other is of unknown type!');
    }
  
    minus(other){
      if(other instanceof Mat){
        if(this.n != other.n || this.m != other.m){
          throw new Error('Other does not match required dimension!');
        }
        
        let result = new Mat(this.n, this.m);
  
        for (let r = 0; r < this.n; r++) {
          for (let c = 0; c < this.m; c++) {
            result._M[r][c] = this._M[r][c] - other._M[r][c];
          }
        }
  
        return result;
  
      }
      else if(isNum(other)) {
        let result = new Mat(this.n, this.m);
  
        for (let r = 0; r < this.n; r++) {
          for (let c = 0; c < this.m; c++) {
            result._M[r][c] = this._M[r][c] - other;
          }
        }
  
        return result;
      }
  
      throw new Error('Other is of unknown type!');
  
    }
  
    times(other){
      if(other instanceof Mat){
        if(this.m != other.n){
          throw new Error('Matrices do not have correct dimensions to be multiplied!');
        }
        
        let result = new Mat(this.n, other.m);
  
        for (let r = 0; r < this.n; r++) {
          for (let c = 0; c < other.m; c++) {
            for (let k = 0; k < this.m; k++) {
              result._M[r][c] += this._M[r][k] * other._M[k][c];
            }
          }
        }
  
        return result;
      }
  
      else if(isNum(other)) {
        let result = new Mat(this.n, this.m);
  
        for (let r = 0; r < this.n; r++) {
          for (let c = 0; c < this.m; c++) {
            result._M[r][c] = this._M[r][c] * other;
          }
        }
  
        return result;
      }
  
      throw new Error('Other is of unknown type!');
    }
  
    max(other) {
      if(!(other instanceof Mat)){
        throw new Error('Other is not a matrix!');
      }
      if(this.n != other.n || other.m != this.m){
        throw new Error('Matrices do not have correct dimensions for maximum!');
      }
  
      let result = new Mat(this.n, this.m);
  
      for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < this.m; c++) {
          result._M[r][c] = Math.max(this._M[r][c], other._M[r][c]);
        }
      }
  
      return result;
    }
  
    min(other) {
      if(!(other instanceof Mat)){
        throw new Error('Other is not a matrix!');
      }
      if(this.n != other.n || other.m != this.m){
        throw new Error('Matrices do not have correct dimensions for minimum!');
      }
  
      let result = new Mat(this.n, this.m);
  
      for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < this.m; c++) {
          result._M[r][c] = Math.min(this._M[r][c], other._M[r][c]);
        }
      }
  
      return result;
    }
  
    to_webgl_array() {
      let ret = [];
        for (let c = 0; c < this.m; c++) {
          for (let r = 0; r < this.n; r++) {
            ret.push(this._M[r][c]);
        }
      }
    
      return ret;
    }
  
    // Stuff specific to vectors
  
    isVec() {
      return this.m == 1;
    }
  
    normalize() {
      if(!this.isVec()) {
        throw new Error('Normalization not available for this matrix!');
      }
  
      let result = new Mat(this.n, 1);
      let length = 0;
  
      for (let i = 0; i < this.n; i++) {
        length += this._M[i][0]*this._M[i][0]
      }
  
      length = Math.sqrt(length);
  
      for (let i = 0; i < this.n; i++) {
        result._M[i][0] = this._M[i][0]/length;
      }
  
      return result;
    }
  
    dot(other) {
      if(!this.isVec()) {
        throw new Error('Dot product not available for this matrix!');
      }
      if(!(other instanceof Mat) || !other.isVec()) {
        throw new Error('Other is not a vector, cannot compute dot product!');
      }
      if(this.n != other.n) {
        throw new Error('Dimensions do not match, cannot compute dot product!');
      }
  
      let result = 0;
  
      for (let i = 0; i < this.n; i++) {
        result += this._M[i][0]*other._M[i][0]
      }
      
      return result
    }
  
    cross(other) {
      if(!this.isVec()) {
        throw new Error('Cross product not available for this matrix (not a vector)!');
      }
      if(this.n != 3) {
        throw new Error('Cross product not available for this matrix (not 3 dimensional)!');
      }
  
      if(!(other instanceof Mat) || !other.isVec()) {
        throw new Error('Other is not a vector, cannot compute cross product!');
      }
      if(this.n != other.n) {
        throw new Error('Dimensions do not match, cannot compute cross product!');
      }
  
      let result = new Mat(3, 1);
  
      for (let i = 0; i < 3; i++) {
        result._M[i][0] = this._M[(i+1)%3]*other._M[(i+2)%3] - this._M[(i+2)%3]*other._M[(i+1)%3];
      }
  
      return result;
    }
  
    x(){
      if(!this.isVec()) {
        throw new Error('Normalization not available for this matrix!');
      }
  
      return this._M[0][0];
    }
  
    y(){
      if(!this.isVec()) {
        throw new Error('Normalization not available for this matrix!');
      }
  
      if(this.n < 2) {
        throw new Error('Vector does not contain this member!');
      }
  
      return this._M[1][0];
    }
  
    z(){
      if(!this.isVec()) {
        throw new Error('Normalization not available for this matrix!');
      }
  
      if(this.n < 3) {
        throw new Error('Vector does not contain this member!');
      }
  
      return this._M[2][0];
    }
  
    w(){
      if(!this.isVec()) {
        throw new Error('Normalization not available for this matrix!');
      }
  
      if(this.n < 4) {
        throw new Error('Vector does not contain this member!');
      }
  
      return this._M[3][0];
    }
  
  }
  
  function identity_mat(n) {
    let I = new Mat(n, n)
    for (let i = 0; i < n; i++) I._M[i][i] = 1;
  
    return I
  }
  
  function vec2(x, y) {
    let v = new Mat(2, 1);
    v._M[0][0] = x;
    v._M[1][0] = y;
  
    return v;
  }
  
  function vec3(x, y, z) {
    let v = new Mat(3, 1);
    v._M[0][0] = x;
    v._M[1][0] = y;
    v._M[2][0] = z;
  
    return v;
  }
  
  function vec4(x, y, z, w) {
    let v = new Mat(4, 1);
    v._M[0][0] = x;
    v._M[1][0] = y;
    v._M[2][0] = z;
    v._M[3][0] = w;
  
    return v;
  }
  