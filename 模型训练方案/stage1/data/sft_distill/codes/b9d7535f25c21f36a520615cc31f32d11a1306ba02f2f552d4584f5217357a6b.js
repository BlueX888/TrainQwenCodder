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

// 全局变量存储移动对象
let movingCircle;
let speed = 2;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建一个大的世界边界，让对象可以移动更远
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  
  // 使用 Graphics 绘制一个圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillCircle(0, 0, 20);
  
  // 生成纹理供 Sprite 使用
  graphics.generateTexture('circleTexture', 40, 40);
  graphics.destroy();
  
  // 创建可移动的圆形精灵
  movingCircle = this.add.sprite(400, 300, 'circleTexture');
  
  // 设置相机跟随圆形对象
  // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
  // roundPixels: 是否四舍五入像素（防止抖动）
  // lerpX/lerpY: 跟随的平滑度（0-1，1为立即跟随，越小越平滑）
  this.cameras.main.startFollow(movingCircle, true, 0.1, 0.1);
  
  // 添加网格背景以更好地观察相机移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 2000; x += 100) {
    gridGraphics.moveTo(x, 0);
    gridGraphics.lineTo(x, 2000);
  }
  for (let y = 0; y <= 2000; y += 100) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(2000, y);
  }
  gridGraphics.strokePath();
  
  // 添加文本提示
  const text = this.add.text(10, 10, '相机跟随圆形对象\n圆形向右下移动', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 设置文本固定在相机视图中（不随相机移动）
  text.setScrollFactor(0);
}

function update(time, delta) {
  // 让圆形持续向右下方移动
  movingCircle.x += speed;
  movingCircle.y += speed;
  
  // 可选：当圆形移出世界边界时重置位置
  if (movingCircle.x > 1900 || movingCircle.y > 1900) {
    movingCircle.x = 100;
    movingCircle.y = 100;
  }
}

// 创建游戏实例
new Phaser.Game(config);