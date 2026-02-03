const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let circleCount = 0;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 生成红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(25, 25, 25); // 在(25,25)位置绘制半径25的圆
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy();

  // 创建定时器事件，每1.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1500, // 1.5秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });

  // 显示提示文本
  this.add.text(10, 10, 'Spawning red circles...', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= 8) {
    if (timerEvent) {
      timerEvent.remove(); // 停止定时器
      timerEvent = null;
    }
    
    // 显示完成提示
    this.add.text(400, 300, 'Max 8 circles spawned!', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);

  // 创建圆形精灵
  const circle = this.add.image(x, y, 'redCircle');
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: circle,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });

  circleCount++;
  
  console.log(`Spawned circle ${circleCount} at (${x}, ${y})`);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

new Phaser.Game(config);