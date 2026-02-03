const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let circle;
let pointer;
const FOLLOW_SPEED = 160;

function preload() {
  // 使用 Graphics 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillCircle(20, 20, 20); // 半径20的圆形
  graphics.generateTexture('purpleCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建紫色圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'purpleCircle');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  const text = this.add.text(10, 10, '移动鼠标，圆形会跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算圆形与鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于1像素时才移动（避免抖动）
  if (distance > 1) {
    // 计算从圆形指向鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间计算本帧应该移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      circle.x = pointer.x;
      circle.y = pointer.y;
    } else {
      // 否则按角度和速度移动
      circle.x += Math.cos(angle) * moveDistance;
      circle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);