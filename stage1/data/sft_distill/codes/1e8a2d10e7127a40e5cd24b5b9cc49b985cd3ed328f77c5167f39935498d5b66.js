const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let circle;
let pointer;
const FOLLOW_SPEED = 80;

function preload() {
  // 使用 Graphics 生成红色圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建红色圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'redCircle');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to see the circle follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
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
    // 计算从圆形指向鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度、delta时间和角度计算移动距离
    // delta 是以毫秒为单位，需要转换为秒
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接移动到目标位置
    if (moveDistance >= distance) {
      circle.x = pointer.x;
      circle.y = pointer.y;
    } else {
      // 根据角度计算 x 和 y 方向的移动量
      circle.x += Math.cos(angle) * moveDistance;
      circle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);