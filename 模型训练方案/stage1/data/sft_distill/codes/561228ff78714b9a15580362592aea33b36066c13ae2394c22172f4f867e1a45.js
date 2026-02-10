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

let diamond;
const MOVE_SPEED = 100; // 每秒向上移动的像素数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置填充颜色为亮蓝色
  graphics.fillStyle(0x00bfff, 1);
  
  // 绘制菱形（中心点在 32, 32）
  graphics.beginPath();
  graphics.moveTo(32, 0);      // 上顶点
  graphics.lineTo(64, 32);     // 右顶点
  graphics.lineTo(32, 64);     // 下顶点
  graphics.lineTo(0, 32);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在场景中央
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置相机边界（扩大场景范围以支持向上移动）
  // 场景宽度保持800，高度扩展到5000以支持长距离移动
  this.cameras.main.setBounds(0, 0, 800, 5000);
  
  // 设置世界边界与相机边界一致
  this.physics.world.setBounds(0, 0, 800, 5000);
  
  // 相机跟随菱形对象
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 添加提示文本（固定在相机视图上）
  const text = this.add.text(10, 10, '菱形自动向上移动\n相机跟随中...', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图，不随场景滚动
}

function update(time, delta) {
  // 让菱形持续向上移动
  // delta 是毫秒，转换为秒
  diamond.y -= MOVE_SPEED * (delta / 1000);
  
  // 可选：当菱形移动到场景顶部时，重置到底部
  if (diamond.y < 0) {
    diamond.y = 5000;
  }
}

new Phaser.Game(config);