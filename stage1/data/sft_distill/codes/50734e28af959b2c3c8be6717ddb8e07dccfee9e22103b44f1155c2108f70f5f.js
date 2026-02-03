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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制一个三角形（等边三角形）
  graphics.fillTriangle(
    32, 0,    // 顶点
    0, 64,    // 左下角
    64, 64    // 右下角
  );
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangle', 64, 64);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（300像素/秒，方向为右下45度）
  const speed = 300;
  const angle = Phaser.Math.DegToRad(45);
  triangle.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置与世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
}

// 创建游戏实例
new Phaser.Game(config);