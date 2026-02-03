const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;
let targetX = 400;
let targetY = 300;
const followSpeed = 300; // 每秒移动的像素数

function preload() {
  // 使用 Graphics 创建青色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形 (中心点在 32, 32)
  graphics.fillStyle(0x00ffff, 1); // 青色
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
  
  // 初始化目标位置为菱形当前位置
  targetX = diamond.x;
  targetY = diamond.y;
  
  // 监听鼠标移动事件，更新目标位置
  this.input.on('pointermove', (pointer) => {
    targetX = pointer.x;
    targetY = pointer.y;
  });
  
  // 如果鼠标已经在场景中，获取初始位置
  if (this.input.activePointer) {
    targetX = this.input.activePointer.x;
    targetY = this.input.activePointer.y;
  }
}

function update(time, delta) {
  // 计算菱形到目标位置的距离
  const distance = Phaser.Math.Distance.Between(
    diamond.x, 
    diamond.y, 
    targetX, 
    targetY
  );
  
  // 如果距离大于1像素，则移动
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      diamond.x, 
      diamond.y, 
      targetX, 
      targetY
    );
    
    // 计算本帧应该移动的距离 (速度 * 时间增量)
    const moveDistance = followSpeed * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，直接到达目标
    if (moveDistance >= distance) {
      diamond.x = targetX;
      diamond.y = targetY;
    } else {
      // 根据角度和移动距离更新位置
      diamond.x += Math.cos(angle) * moveDistance;
      diamond.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);