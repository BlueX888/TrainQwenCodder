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

// 存储生成的圆形
let circles = [];

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化圆形数组
  circles = [];
  
  // 添加标题文本
  this.add.text(400, 30, '每1.5秒生成一个红色圆形（最多8个）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 显示计数器
  const counterText = this.add.text(400, 60, '已生成: 0/8', {
    fontSize: '18px',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每1.5秒触发一次，最多重复7次（加上首次共8次）
  this.time.addEvent({
    delay: 1500,                    // 1.5秒 = 1500毫秒
    callback: spawnCircle,          // 回调函数
    callbackScope: this,            // 回调函数的作用域
    args: [counterText],            // 传递参数
    repeat: 7,                      // 重复7次，加上首次执行共8次
    loop: false                     // 不循环
  });
}

function spawnCircle(counterText) {
  // 生成随机位置（避免圆形超出边界）
  const radius = 30;
  const x = Phaser.Math.Between(radius + 50, 800 - radius - 50);
  const y = Phaser.Math.Between(radius + 100, 600 - radius - 50);
  
  // 创建 Graphics 对象绘制红色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);  // 红色，不透明
  graphics.fillCircle(x, y, radius);
  
  // 添加白色边框使圆形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeCircle(x, y, radius);
  
  // 存储圆形
  circles.push(graphics);
  
  // 更新计数器文本
  counterText.setText(`已生成: ${circles.length}/8`);
  
  // 添加缩放动画效果
  graphics.setScale(0);
  this.tweens.add({
    targets: graphics,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 在圆形中心显示序号
  this.add.text(x, y, circles.length.toString(), {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 如果达到8个，显示完成提示
  if (circles.length === 8) {
    this.time.delayedCall(500, () => {
      this.add.text(400, 550, '已生成全部8个圆形！', {
        fontSize: '24px',
        color: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    });
  }
}

new Phaser.Game(config);