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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制三角形（等边三角形，中心在 (25, 25)）
  graphics.beginPath();
  graphics.moveTo(25, 5);      // 顶点
  graphics.lineTo(5, 45);       // 左下角
  graphics.lineTo(45, 45);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建带物理引擎的三角形精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（随机方向，速度大小为 360）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 360;
  const velocityY = Math.sin(angle * Math.PI / 180) * 360;
  triangle.setVelocity(velocityX, velocityY);
  
  // 设置碰撞边界
  triangle.setCollideWorldBounds(true); // 启用世界边界碰撞
  triangle.setBounce(1, 1); // 设置反弹系数为 1（完全弹性碰撞）
  
  // 可选：添加一些视觉反馈文本
  this.add.text(10, 10, '绿色三角形以 360 速度移动\n碰到边界会反弹', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

// 创建游戏实例
new Phaser.Game(config);