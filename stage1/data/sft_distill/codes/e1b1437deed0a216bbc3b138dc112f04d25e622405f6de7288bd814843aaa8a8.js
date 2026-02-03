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
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制三角形（等边三角形）
  graphics.fillTriangle(
    30, 0,    // 顶点
    0, 50,    // 左下
    60, 50    // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 60, 50);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
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
    // 可以在这里添加边界碰撞的额外逻辑
  });
}

new Phaser.Game(config);