const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  // 使用 Graphics 绘制红色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制六边形（中心点在 32, 32，半径 30）
  const hexagonPath = [];
  const radius = 30;
  const centerX = 32;
  const centerY = 32;
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    hexagonPath.push(x, y);
  }
  
  graphics.fillPoints(hexagonPath, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置碰撞世界边界
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 设置初始速度（160像素/秒，45度角方向）
  const speed = 160;
  const angle = Math.PI / 4; // 45度
  hexagon.setVelocity(
    speed * Math.cos(angle),
    speed * Math.sin(angle)
  );
  
  // 确保物理世界边界与画布一致
  this.physics.world.setBounds(0, 0, 800, 600);
}

new Phaser.Game(config);