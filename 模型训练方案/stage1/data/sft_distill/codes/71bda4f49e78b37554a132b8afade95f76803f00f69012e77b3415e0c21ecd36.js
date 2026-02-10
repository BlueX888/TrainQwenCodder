const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let rectangle;
let pointer;
const FOLLOW_SPEED = 120; // 每秒移动的像素数

function preload() {
  // 使用 Graphics 创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('whiteRect', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建白色矩形精灵，初始位置在屏幕中心
  rectangle = this.add.sprite(400, 300, 'whiteRect');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算矩形当前位置到鼠标位置的距离
  const distance = Phaser.Math.Distance.Between(
    rectangle.x,
    rectangle.y,
    mouseX,
    mouseY
  );
  
  // 只有当距离大于一个很小的阈值时才移动（避免抖动）
  if (distance > 1) {
    // 计算方向向量（归一化）
    const directionX = (mouseX - rectangle.x) / distance;
    const directionY = (mouseY - rectangle.y) / distance;
    
    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
      rectangle.x = mouseX;
      rectangle.y = mouseY;
    } else {
      // 否则按照方向和速度移动
      rectangle.x += directionX * moveDistance;
      rectangle.y += directionY * moveDistance;
    }
  }
}

new Phaser.Game(config);