const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;
let pointer;
const FOLLOW_SPEED = 240; // 像素/秒

function preload() {
  // 使用 Graphics 创建粉色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（四个顶点）
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，初始位置在屏幕中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 获取指针对象
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算菱形与鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    diamond.x,
    diamond.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      diamond.x,
      diamond.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      diamond.x = pointer.x;
      diamond.y = pointer.y;
    } else {
      // 根据角度和移动距离计算新位置
      diamond.x += Math.cos(angle) * moveDistance;
      diamond.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);