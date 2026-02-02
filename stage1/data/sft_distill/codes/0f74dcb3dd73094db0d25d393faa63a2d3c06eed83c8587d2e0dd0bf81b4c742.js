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
let timerEvent = null;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 生成粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径 25 的圆
  graphics.generateTexture('pinkCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建定时器，每 0.5 秒执行一次
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5 秒 = 500 毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已生成 8 个圆形
  if (circleCount >= 8) {
    // 达到上限，移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }

  // 生成随机位置（确保圆形完全在画布内）
  const x = Phaser.Math.Between(25, 775); // 25 是圆形半径
  const y = Phaser.Math.Between(25, 575);

  // 在随机位置创建粉色圆形
  const circle = this.add.image(x, y, 'pinkCircle');
  
  // 增加计数器
  circleCount++;
  
  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);