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
  // 使用 Graphics 绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形，中心在(25, 25)
  
  // 生成纹理
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵并添加到场景中心
  const circle = this.physics.add.sprite(400, 300, 'circle');
  
  // 设置物理属性
  circle.setCollideWorldBounds(true); // 启用世界边界碰撞
  circle.setBounce(1); // 设置反弹系数为1（完全弹性碰撞）
  
  // 设置初始速度（360像素/秒，方向为右下45度）
  const speed = 360;
  const angle = Math.PI / 4; // 45度角
  circle.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 确保物理体是圆形（更精确的碰撞检测）
  circle.body.setCircle(25);
}

// 创建游戏实例
new Phaser.Game(config);