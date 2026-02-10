const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

let circleCount = 0;
const MAX_CIRCLES = 20;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 添加标题文本
  this.add.text(10, 10, '每 3 秒生成一个青色圆形 (最多 20 个)', {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 添加计数器文本
  const counterText = this.add.text(10, 40, `已生成: ${circleCount} / ${MAX_CIRCLES}`, {
    fontSize: '16px',
    color: '#00ffff'
  });
  
  // 创建定时器事件，每 3 秒执行一次
  timerEvent = this.time.addEvent({
    delay: 3000,           // 3 秒（3000 毫秒）
    callback: spawnCircle, // 回调函数
    callbackScope: scene,  // 回调作用域
    loop: true,            // 循环执行
    args: [counterText]    // 传递参数
  });
  
  // 立即生成第一个圆形（不等待 3 秒）
  spawnCircle.call(scene, counterText);
}

function spawnCircle(counterText) {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 显示完成提示
    this.add.text(400, 300, '已生成 20 个圆形！', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置（留出边距避免圆形被裁剪）
  const radius = 20;
  const x = Phaser.Math.Between(radius + 10, 800 - radius - 10);
  const y = Phaser.Math.Between(radius + 80, 600 - radius - 10);
  
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色 (Cyan)
  graphics.fillCircle(x, y, radius);
  
  // 添加描边使圆形更明显
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokeCircle(x, y, radius);
  
  // 增加计数
  circleCount++;
  
  // 更新计数器文本
  counterText.setText(`已生成: ${circleCount} / ${MAX_CIRCLES}`);
  
  // 添加生成动画效果（可选）
  graphics.setScale(0);
  this.tweens.add({
    targets: graphics,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
}

// 创建游戏实例
new Phaser.Game(config);