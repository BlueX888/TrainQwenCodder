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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 生成粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径25的圆
  graphics.generateTexture('pinkCircle', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建定时器事件，每0.5秒执行一次
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒 = 500毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    timerEvent.remove(); // 停止定时器
    return;
  }
  
  // 生成随机位置（考虑圆形半径，避免超出边界）
  const radius = 25;
  const x = Phaser.Math.Between(radius, 800 - radius);
  const y = Phaser.Math.Between(radius, 600 - radius);
  
  // 创建圆形精灵
  const circle = this.add.image(x, y, 'pinkCircle');
  
  // 增加计数
  circleCount++;
  
  // 可选：添加淡入效果
  circle.setAlpha(0);
  this.tweens.add({
    targets: circle,
    alpha: 1,
    duration: 200,
    ease: 'Power2'
  });
}

new Phaser.Game(config);