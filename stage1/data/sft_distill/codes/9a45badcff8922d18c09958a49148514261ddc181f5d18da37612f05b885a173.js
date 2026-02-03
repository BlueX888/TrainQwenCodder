const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let square;
let pointer;
const FOLLOW_SPEED = 360; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('squareTex', 50, 50);
  graphics.destroy();

  // 创建方块精灵，初始位置在屏幕中心
  square = this.add.sprite(400, 300, 'squareTex');
  
  // 获取鼠标指针
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算方块中心到鼠标指针的距离
  const dx = pointer.x - square.x;
  const dy = pointer.y - square.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 如果距离很小（小于1像素），停止移动避免抖动
  if (distance < 1) {
    return;
  }
  
  // 计算移动方向（归一化向量）
  const dirX = dx / distance;
  const dirY = dy / distance;
  
  // 计算本帧应该移动的距离（速度 * 时间）
  // delta 是毫秒，需要转换为秒
  const moveDistance = FOLLOW_SPEED * (delta / 1000);
  
  // 如果本帧移动距离大于剩余距离，直接到达目标位置
  if (moveDistance >= distance) {
    square.x = pointer.x;
    square.y = pointer.y;
  } else {
    // 否则按照方向移动
    square.x += dirX * moveDistance;
    square.y += dirY * moveDistance;
  }
}

new Phaser.Game(config);