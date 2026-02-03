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
const MAX_CIRCLES = 15;
let timerEvent;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 初始化计数器
  circleCount = 0;
  
  // 创建定时器事件，每1秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,                    // 1秒 = 1000毫秒
    callback: spawnCircle,          // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true                      // 循环执行
  });
  
  // 添加文本提示
  this.add.text(10, 10, '橙色圆形生成中...', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function spawnCircle() {
  // 检查是否达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    // 停止并移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 显示完成提示
    this.add.text(10, 40, '已生成15个圆形！', {
      fontSize: '20px',
      color: '#00ff00'
    });
    
    return;
  }
  
  // 生成随机位置
  // 圆形半径为20，确保不会超出边界
  const radius = 20;
  const x = Phaser.Math.Between(radius, this.game.config.width - radius);
  const y = Phaser.Math.Between(radius + 50, this.game.config.height - radius);
  
  // 使用 Graphics 绘制橙色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1);  // 橙色 (Orange)
  graphics.fillCircle(x, y, radius);
  
  // 增加计数
  circleCount++;
  
  // 更新计数显示（可选）
  const countText = this.add.text(x, y, circleCount.toString(), {
    fontSize: '14px',
    color: '#000000'
  });
  countText.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);