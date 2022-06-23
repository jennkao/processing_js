class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    console.alert('unimplemented draw method');
  }
}

class Apple extends Food {
  colors = ['#a7c957', '#ba181b'];
  constructor(x, y) {
    super(x, y);
    this.color = random(this.colors);
    this.width = 30;
    this.height = 25;
  }

  draw() {
    push();
    noStroke();
    translate(this.x, this.y);
    fill(this.color);
    ellipseMode(CENTER);
    beginShape();
    ellipse(0, -10, this.width, this.height);
    stroke(78, 38, 0);
    strokeWeight(5);
    line(-5, -40, 0, -25);
    noStroke();
    rotate(radians(-30));
    fill(39, 166, 21);
    ellipse(4, -30, 10, 15);
    endShape();
    pop();
  }
}
