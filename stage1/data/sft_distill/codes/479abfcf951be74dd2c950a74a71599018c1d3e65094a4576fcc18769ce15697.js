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

let hexagonCount = 0;
const MAX_HEXAGONS = 20;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建六边形纹理
  createHexagonTexture(this);
  
  // 添加提示文本
  this.add.text(10, 10, '蓝色六边形将每2秒生成一个，最多20个', {
    fontSize: '16px',
    color: '#ffffff'
  });
  
  // 添加计数文本
  const countText = this.add.text(10, 40, `已生成: 0 / ${MAX_HEXAGONS}`, {
    fontSize: '16px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每2秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2000,                    // 2秒
    callback: () => {
      if (hexagonCount < MAX_HEXAGONS) {
        spawnHexagon(this);
        hexagonCount++;
        countText.setText(`已生成: ${hexagonCount} / ${MAX_HEXAGONS}`);
        
        // 达到最大数量时移除定时器
        if (hexagonCount >= MAX_HEXAGONS) {
          timerEvent.remove();
          this.add.text(10, 70, '已达到最大数量！', {
            fontSize: '16px',
            color: '#ffff00'
          });
        }
      }
    },
    callbackScope: this,
    loop: true                      // 循环执行
  });
}

/**
 * 创建六边形纹理
 */
function createHexagonTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 计算六边形顶点（半径30）
  const radius = 30;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    points.push(x, y);
  }
  
  // 绘制蓝色六边形
  graphics.fillStyle(0x0066ff, 1);
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框
  graphics.lineStyle(2, 0x0044cc, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
}

/**
 * 在随机位置生成六边形
 */
function spawnHexagon(scene) {
  // 生成随机位置（留出边距避免超出屏幕）
  const margin = 40;
  const x = Phaser.Math.Between(margin, scene.game.config.width - margin);
  const y = Phaser.Math.Between(margin + 100, scene.game.config.height - margin);
  
  // 创建六边形精灵
  const hexagon = scene.add.image(x, y, 'hexagon');
  
  // 添加简单的缩放动画效果
  hexagon.setScale(0);
  scene.tweens.add({
    targets: hexagon,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 添加轻微的旋转动画
  scene.tweens.add({
    targets: hexagon,
    angle: 360,
    duration: 2000,
    repeat: -1,
    ease: 'Linear'
  });
}

new Phaser.Game(config);