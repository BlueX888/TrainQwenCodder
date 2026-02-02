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
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建紫色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（使用多边形）
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.lineStyle(2, 0x7b1fa2, 1); // 深紫色边框
  
  // 菱形的四个顶点（中心点为 25, 25，尺寸 50x50）
  const diamond = new Phaser.Geom.Polygon([
    25, 0,    // 上顶点
    50, 25,   // 右顶点
    25, 50,   // 下顶点
    0, 25     // 左顶点
  ]);
  
  graphics.fillPoints(diamond.points, true);
  graphics.strokePoints(diamond.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 50, 50);
  graphics.destroy();
  
  // 重置计数器
  diamondCount = 0;
  
  // 创建定时器事件，每2.5秒生成一个菱形
  timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒
    callback: spawnDiamond,
    callbackScope: this,
    loop: true
  });
  
  // 添加文本显示当前生成数量
  const text = this.add.text(10, 10, `菱形数量: ${diamondCount}/${MAX_DIAMONDS}`, {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  // 存储文本对象以便更新
  this.diamondText = text;
}

function spawnDiamond() {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    timerEvent.remove(); // 移除定时器
    console.log('已生成12个菱形，停止生成');
    return;
  }
  
  // 生成随机位置（留出边距避免菱形超出边界）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 创建菱形精灵
  const diamond = this.add.image(x, y, 'diamond');
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: diamond,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 300,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });
  
  // 增加计数
  diamondCount++;
  
  // 更新文本显示
  this.diamondText.setText(`菱形数量: ${diamondCount}/${MAX_DIAMONDS}`);
  
  console.log(`生成第 ${diamondCount} 个菱形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);