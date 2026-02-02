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
const MAX_DIAMONDS = 10;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建白色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（四个顶点：上、右、下、左）
  graphics.fillStyle(0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建定时器事件，每4秒生成一个菱形
  const timerEvent = this.time.addEvent({
    delay: 4000,                    // 4秒
    callback: spawnDiamond,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true                      // 循环执行
  });
  
  // 菱形生成函数
  function spawnDiamond() {
    if (diamondCount >= MAX_DIAMONDS) {
      // 达到最大数量，停止定时器
      timerEvent.remove();
      console.log('已生成10个菱形，停止生成');
      return;
    }
    
    // 生成随机位置（避免菱形超出边界）
    const x = Phaser.Math.Between(32, 768);
    const y = Phaser.Math.Between(32, 568);
    
    // 创建菱形精灵
    const diamond = this.add.image(x, y, 'diamond');
    
    // 添加简单的淡入动画效果
    diamond.setAlpha(0);
    this.tweens.add({
      targets: diamond,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
    
    diamondCount++;
    console.log(`生成第 ${diamondCount} 个菱形，位置: (${x}, ${y})`);
  }
  
  // 添加提示文本
  const text = this.add.text(10, 10, '每4秒生成一个白色菱形，最多10个', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);