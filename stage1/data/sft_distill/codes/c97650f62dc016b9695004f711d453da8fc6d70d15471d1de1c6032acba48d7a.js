const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let triangle;
let camera;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格范围更大，以便三角形移动时能看到
  for (let x = -2000; x <= 2000; x += 50) {
    gridGraphics.moveTo(x, -2000);
    gridGraphics.lineTo(x, 2000);
  }
  for (let y = -2000; y <= 2000; y += 50) {
    gridGraphics.moveTo(-2000, y);
    gridGraphics.lineTo(2000, y);
  }
  gridGraphics.strokePath();
  
  // 使用 Graphics 绘制三角形并生成纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-25, 20);     // 左下
  graphics.lineTo(25, 20);      // 右下
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 50, 50);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在场景中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 添加标识文字
  const text = this.add.text(400, 300, 'Follow Me!', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  });
  text.setOrigin(0.5);
  text.setDepth(1);
  
  // 让文字跟随三角形
  this.tweens.addCounter({
    from: 0,
    to: 1,
    duration: 100,
    repeat: -1,
    onUpdate: () => {
      text.setPosition(triangle.x, triangle.y + 40);
    }
  });
  
  // 获取主相机并设置跟随三角形
  camera = this.cameras.main;
  camera.startFollow(triangle, true, 0.1, 0.1);
  
  // 设置相机边界（可选，让相机有更大的移动空间）
  camera.setBounds(-2000, -2000, 4000, 4000);
  
  // 添加提示信息（固定在屏幕上）
  const info = this.add.text(10, 10, 'Camera follows the triangle\nMoving to top-left', {
    fontSize: '14px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 8, y: 8 }
  });
  info.setScrollFactor(0); // 固定在屏幕上，不随相机移动
  info.setDepth(2);
}

function update(time, delta) {
  // 让三角形持续向左上方移动
  // 向左移动（x 减小）
  triangle.x -= 2;
  // 向上移动（y 减小）
  triangle.y -= 2;
  
  // 可选：旋转三角形使其朝向移动方向
  triangle.rotation = Math.atan2(-2, -2);
}

new Phaser.Game(config);