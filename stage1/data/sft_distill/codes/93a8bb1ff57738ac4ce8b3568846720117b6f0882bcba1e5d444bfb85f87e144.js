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

// 菱形计数器
let diamondCount = 0;
const MAX_DIAMONDS = 12;
let timerEvent = null;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建紫色菱形纹理
  createDiamondTexture.call(this);
  
  // 添加标题文本
  this.add.text(400, 30, '紫色菱形生成器', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数器文本
  const countText = this.add.text(400, 70, `菱形数量: ${diamondCount}/${MAX_DIAMONDS}`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每2.5秒生成一个菱形
  timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: () => {
      spawnDiamond.call(this, countText);
    },
    callbackScope: this,
    loop: true
  });
}

/**
 * 创建菱形纹理
 */
function createDiamondTexture() {
  const graphics = this.add.graphics();
  
  // 设置紫色填充
  graphics.fillStyle(0x9932cc, 1); // 紫色
  
  // 绘制菱形（使用四个三角形或多边形）
  const size = 30;
  const centerX = size;
  const centerY = size;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size); // 上顶点
  graphics.lineTo(centerX + size, centerY); // 右顶点
  graphics.lineTo(centerX, centerY + size); // 下顶点
  graphics.lineTo(centerX - size, centerY); // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加白色边框
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
}

/**
 * 在随机位置生成菱形
 */
function spawnDiamond(countText) {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 显示完成提示
    this.add.text(400, 550, '已生成全部12个菱形！', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置（避免太靠近边缘）
  const margin = 50;
  const randomX = Phaser.Math.Between(margin, this.scale.width - margin);
  const randomY = Phaser.Math.Between(120, this.scale.height - margin);
  
  // 创建菱形精灵
  const diamond = this.add.image(randomX, randomY, 'diamond');
  
  // 添加生成动画效果
  diamond.setScale(0);
  diamond.setAlpha(0);
  
  this.tweens.add({
    targets: diamond,
    scale: 1,
    alpha: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 添加旋转动画
  this.tweens.add({
    targets: diamond,
    angle: 360,
    duration: 2000,
    repeat: -1,
    ease: 'Linear'
  });
  
  // 增加计数
  diamondCount++;
  
  // 更新计数器文本
  countText.setText(`菱形数量: ${diamondCount}/${MAX_DIAMONDS}`);
}

// 启动游戏
new Phaser.Game(config);