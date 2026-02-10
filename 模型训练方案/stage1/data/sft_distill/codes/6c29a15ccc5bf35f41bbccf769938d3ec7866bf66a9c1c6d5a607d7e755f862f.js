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

let starCount = 0;
const MAX_STARS = 15;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建星形纹理
  createStarTexture(this);
  
  // 初始化星形计数器
  starCount = 0;
  
  // 添加提示文本
  this.add.text(10, 10, '黄色星形生成中...', {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  // 添加计数文本
  const countText = this.add.text(10, 40, `星形数量: ${starCount}/${MAX_STARS}`, {
    fontSize: '18px',
    color: '#ffff00'
  });
  
  // 创建定时器事件，每4秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 4000,                    // 4秒
    callback: () => {
      if (starCount < MAX_STARS) {
        // 在随机位置生成星形
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(100, 550);
        
        const star = this.add.image(x, y, 'star');
        star.setScale(0.5);
        
        // 添加简单的淡入动画
        star.setAlpha(0);
        this.tweens.add({
          targets: star,
          alpha: 1,
          duration: 500,
          ease: 'Power2'
        });
        
        starCount++;
        countText.setText(`星形数量: ${starCount}/${MAX_STARS}`);
        
        // 如果达到最大数量，移除定时器
        if (starCount >= MAX_STARS) {
          timerEvent.remove();
          this.add.text(10, 70, '已生成所有星形！', {
            fontSize: '18px',
            color: '#00ff00'
          });
        }
      }
    },
    callbackScope: this,
    loop: true                      // 循环执行
  });
}

/**
 * 创建星形纹理
 * @param {Phaser.Scene} scene - 当前场景
 */
function createStarTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制星形的参数
  const centerX = 64;
  const centerY = 64;
  const outerRadius = 50;
  const innerRadius = 20;
  const points = 5;
  
  // 计算星形的顶点
  const starPoints = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    starPoints.push(x, y);
  }
  
  // 绘制星形
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
}

new Phaser.Game(config);