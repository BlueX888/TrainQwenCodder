const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let circle;
let pointer;
const FOLLOW_SPEED = 120;

function preload() {
  // 使用 Graphics 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circleTexture', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建圆形精灵，初始位置在画布中心
  circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算圆形到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于1像素时才移动，避免抖动
  if (distance > 1) {
    // 计算圆形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应移动的距离（速度 * 时间差，delta是毫秒，需转换为秒）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
      circle.x = pointer.x;
      circle.y = pointer.y;
    } else {
      // 根据角度和速度计算新位置
      circle.x += Math.cos(angle) * moveDistance;
      circle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);