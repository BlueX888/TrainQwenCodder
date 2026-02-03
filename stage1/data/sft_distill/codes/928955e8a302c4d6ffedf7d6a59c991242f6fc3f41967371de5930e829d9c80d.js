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

let follower;
let pointer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建绿色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('greenRect', 50, 50);
  graphics.destroy();

  // 创建跟随者精灵，初始位置在屏幕中心
  follower = this.add.sprite(400, 300, 'greenRect');
  
  // 获取指针对象
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to see the green rectangle follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算跟随速度系数（速度80，转换为每秒移动的像素数）
  // delta 是毫秒，所以需要除以1000转换为秒
  const speed = 80;
  const lerpFactor = speed * (delta / 1000);
  
  // 使用线性插值实现平滑跟随
  // Phaser.Math.Linear(start, end, t) 其中 t 是插值系数 (0-1)
  // 为了实现固定速度跟随，我们需要计算移动距离
  const dx = pointer.x - follower.x;
  const dy = pointer.y - follower.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 1) {
    // 计算实际移动距离，不超过目标距离
    const moveDistance = Math.min(lerpFactor, distance);
    const ratio = moveDistance / distance;
    
    follower.x += dx * ratio;
    follower.y += dy * ratio;
  }
}

new Phaser.Game(config);