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
const MAX_CIRCLES = 5;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用Graphics创建红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy();

  // 创建定时器事件，每2.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });

  // 添加提示文本
  this.add.text(10, 10, 'Spawning red circles every 2.5s (max 5)', {
    fontSize: '18px',
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
    this.add.text(400, 300, 'All 5 circles spawned!', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const randomX = Phaser.Math.Between(50, 750);
  const randomY = Phaser.Math.Between(50, 550);

  // 创建红色圆形精灵
  const circle = this.add.image(randomX, randomY, 'redCircle');
  
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

  // 更新计数显示（可选）
  console.log(`Circle spawned at (${randomX}, ${randomY}). Total: ${circleCount}/${MAX_CIRCLES}`);
}

new Phaser.Game(config);