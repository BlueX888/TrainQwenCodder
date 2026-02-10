const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let circle;
let pointer;
const FOLLOW_SPEED = 360; // 每秒移动的像素

function preload() {
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillCircle(25, 25, 25); // 半径25的圆
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建蓝色圆形精灵
  circle = this.add.sprite(400, 300, 'blueCircle');
  
  // 获取鼠标指针
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算圆形中心到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于一定阈值时才移动，避免抖动
  if (distance > 5) {
    // 计算从圆形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间增量计算移动距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于实际距离，直接移动到目标位置
    if (moveDistance >= distance) {
      circle.x = pointer.x;
      circle.y = pointer.y;
    } else {
      // 按照角度方向移动
      circle.x += Math.cos(angle) * moveDistance;
      circle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);