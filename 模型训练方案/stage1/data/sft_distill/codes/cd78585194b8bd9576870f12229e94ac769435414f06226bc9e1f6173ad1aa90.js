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
  // 使用 Graphics 绘制黄色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制等边三角形（中心点在纹理中心）
  const size = 40;
  const centerX = size / 2;
  const centerY = size / 2;
  const height = size * Math.sqrt(3) / 2;
  
  graphics.fillTriangle(
    centerX, centerY - height * 2/3,           // 顶点
    centerX - size / 2, centerY + height / 3,  // 左下角
    centerX + size / 2, centerY + height / 3   // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', size, size);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（200像素/秒）
  triangle.setVelocity(200, 200);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 启用世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 可选：让三角形旋转以增加视觉效果
  this.physics.world.on('worldbounds', () => {
    // 可以在这里添加碰撞音效或其他效果
  });
}

new Phaser.Game(config);