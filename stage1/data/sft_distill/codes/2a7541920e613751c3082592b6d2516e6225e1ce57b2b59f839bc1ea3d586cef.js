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
  // 使用 Graphics 绘制粉色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制三角形（等边三角形）
  // 三个顶点坐标：顶部中心、左下、右下
  graphics.fillTriangle(
    30, 10,   // 顶点
    10, 50,   // 左下
    50, 50    // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（200 速度，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 200;
  const velocityY = Math.sin(angle * Math.PI / 180) * 200;
  triangle.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：添加一些文字说明
  this.add.text(10, 10, '粉色三角形以200速度移动\n碰到边界会反弹', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

// 创建游戏实例
new Phaser.Game(config);