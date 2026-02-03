const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -30);    // 顶点
  graphics.lineTo(-26, 15);   // 左下角
  graphics.lineTo(26, 15);    // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 52, 45);
  graphics.destroy();
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（随机方向，速度为300）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 300;
  const velocityY = Math.sin(angle * Math.PI / 180) * 300;
  triangle.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：让三角形根据移动方向旋转
  this.physics.world.on('worldbounds', (body) => {
    // 世界边界碰撞事件（可用于调试）
  });
}

new Phaser.Game(config);