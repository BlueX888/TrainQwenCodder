const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

let diamondCount = 0;
const MAX_DIAMONDS = 12;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建红色菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制菱形路径（中心点为原点）
  const size = 30;
  const diamond = new Phaser.Geom.Polygon([
    0, -size,      // 上顶点
    size, 0,       // 右顶点
    0, size,       // 下顶点
    -size, 0       // 左顶点
  ]);
  
  graphics.fillPoints(diamond.points, true);
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建定时器事件，每4秒生成一个菱形
  this.time.addEvent({
    delay: 4000,                    // 4秒间隔
    callback: spawnDiamond,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    startAt: 0                      // 立即开始第一次
  });
  
  // 显示提示文本
  this.add.text(10, 10, 'Diamonds: 0 / 12', {
    fontSize: '20px',
    color: '#ffffff'
  }).setName('counterText');
}

function spawnDiamond() {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    // 停止所有定时器事件
    this.time.removeAllEvents();
    
    // 更新文本显示完成状态
    const counterText = this.children.getByName('counterText');
    if (counterText) {
      counterText.setText('Diamonds: 12 / 12 (Complete!)');
    }
    return;
  }
  
  // 生成随机位置（留出边距避免菱形超出边界）
  const margin = 40;
  const randomX = Phaser.Math.Between(margin, 800 - margin);
  const randomY = Phaser.Math.Between(margin, 600 - margin);
  
  // 创建菱形精灵
  const diamond = this.add.image(randomX, randomY, 'diamond');
  
  // 添加简单的缩放动画效果
  diamond.setScale(0);
  this.tweens.add({
    targets: diamond,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 增加计数器
  diamondCount++;
  
  // 更新文本显示
  const counterText = this.children.getByName('counterText');
  if (counterText) {
    counterText.setText(`Diamonds: ${diamondCount} / ${MAX_DIAMONDS}`);
  }
}

// 启动游戏
new Phaser.Game(config);