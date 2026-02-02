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

let circleCount = 0;
const MAX_CIRCLES = 8;
let timerEvent;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 生成红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径25的圆
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy();

  // 创建定时器事件，每1.5秒执行一次
  timerEvent = this.time.addEvent({
    delay: 1500,              // 1.5秒 = 1500毫秒
    callback: spawnCircle,    // 回调函数
    callbackScope: this,      // 回调函数的作用域
    loop: true                // 循环执行
  });

  // 显示提示文本
  this.add.text(10, 10, 'Spawning red circles...', {
    fontSize: '20px',
    color: '#ffffff'
  });

  // 显示计数文本
  this.countText = this.add.text(10, 40, `Circles: ${circleCount}/${MAX_CIRCLES}`, {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 显示完成提示
    this.add.text(400, 300, 'All circles spawned!', {
      fontSize: '32px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const radius = 25;
  const randomX = Phaser.Math.Between(radius, this.game.config.width - radius);
  const randomY = Phaser.Math.Between(radius + 70, this.game.config.height - radius);

  // 创建红色圆形精灵
  const circle = this.add.sprite(randomX, randomY, 'redCircle');
  
  // 添加简单的缩放动画效果
  circle.setScale(0);
  this.tweens.add({
    targets: circle,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });

  // 增加计数
  circleCount++;
  
  // 更新计数文本
  this.countText.setText(`Circles: ${circleCount}/${MAX_CIRCLES}`);
}

new Phaser.Game(config);