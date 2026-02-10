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
  // 预加载阶段（本例无需加载外部资源）
}

function create() {
  // 使用 Graphics 绘制粉色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制一个等边三角形（顶点在上方）
  graphics.fillTriangle(
    32, 10,   // 顶点
    10, 54,   // 左下角
    54, 54    // 右下角
  );
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangle', 64, 64);
  graphics.destroy(); // 销毁 Graphics 对象释放资源
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（x方向200，y方向200）
  triangle.setVelocity(200, 200);
  
  // 设置与世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：设置三角形旋转以增加视觉效果
  this.physics.world.on('worldbounds', () => {
    triangle.angle += 45; // 每次碰撞旋转45度
  });
}

// 启动游戏
new Phaser.Game(config);