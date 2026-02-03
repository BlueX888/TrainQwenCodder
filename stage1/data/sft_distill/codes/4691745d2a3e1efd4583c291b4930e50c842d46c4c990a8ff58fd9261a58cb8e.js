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
const moveSpeed = 100; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界，足够大以容纳移动
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  this.physics.world.setBounds(0, 0, 2000, 2000);

  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6b6b, 1);
  
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

  // 创建菱形精灵，初始位置在世界中心
  diamond = this.add.sprite(1000, 1000, 'diamond');
  
  // 设置相机跟随菱形
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 可选：设置跟随偏移量（这里保持居中，所以偏移为 0）
  this.cameras.main.setFollowOffset(0, 0);

  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随菱形\n菱形向左上移动', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界移动
}

function update(time, delta) {
  // 让菱形向左上方移动
  // 左上方向：x 减少，y 减少
  const deltaSeconds = delta / 1000;
  
  diamond.x -= moveSpeed * deltaSeconds * 0.707; // 向左移动（cos 45°）
  diamond.y -= moveSpeed * deltaSeconds * 0.707; // 向上移动（sin 45°）
  
  // 可选：限制在世界边界内
  diamond.x = Phaser.Math.Clamp(diamond.x, 32, 1968);
  diamond.y = Phaser.Math.Clamp(diamond.y, 32, 1968);
}

new Phaser.Game(config);