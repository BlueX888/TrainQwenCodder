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
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let triangle;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向上方的三角形
  graphics.beginPath();
  graphics.moveTo(0, -20);    // 顶点
  graphics.lineTo(-15, 20);   // 左下角
  graphics.lineTo(15, 20);    // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 30, 40);
  graphics.destroy();
  
  // 扩大世界边界，让三角形有足够的移动空间
  this.physics.world.setBounds(-2000, -2000, 4000, 4000);
  
  // 创建三角形 Sprite，初始位置在屏幕中心
  triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置三角形向左上方移动
  // 负 x 表示向左，负 y 表示向上
  triangle.setVelocity(-100, -100);
  
  // 设置相机跟随三角形
  this.cameras.main.startFollow(triangle);
  
  // 可选：设置相机边界与世界边界一致
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 添加一些参考网格，帮助观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x555555, 0.5);
  
  // 绘制网格线
  for (let x = -2000; x <= 2000; x += 100) {
    gridGraphics.lineBetween(x, -2000, x, 2000);
  }
  for (let y = -2000; y <= 2000; y += 100) {
    gridGraphics.lineBetween(-2000, y, 2000, y);
  }
  
  // 在中心绘制一个参考点
  const centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0xff0000, 1);
  centerGraphics.fillCircle(400, 300, 5);
  
  // 添加文本提示
  const text = this.add.text(10, 10, '三角形正在向左上方移动\n相机自动跟随', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 可选：显示三角形当前位置
  // console.log('Triangle position:', triangle.x, triangle.y);
}

// 创建游戏实例
new Phaser.Game(config);