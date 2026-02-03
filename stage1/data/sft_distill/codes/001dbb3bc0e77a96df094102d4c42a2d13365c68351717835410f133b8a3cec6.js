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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成粉色星形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createStar(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建粉色星形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createStar(scene, x, y) {
  // 使用 Graphics 绘制星形
  const graphics = scene.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1); // 粉色 (HotPink)
  
  // 绘制星形路径
  const points = 5; // 五角星
  const outerRadius = 24; // 外半径 (总尺寸48像素)
  const innerRadius = 12; // 内半径
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(px, py);
    } else {
      graphics.lineTo(px, py);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使星形更明显
  graphics.lineStyle(2, 0xff1493, 1); // 深粉色描边
  graphics.strokePath();
}

new Phaser.Game(config);