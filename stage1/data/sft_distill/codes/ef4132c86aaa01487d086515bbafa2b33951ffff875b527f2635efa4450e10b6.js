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
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    createHexagon(this, pointer.x, pointer.y);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create cyan hexagons', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

/**
 * 在指定位置创建一个青色六边形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - 中心X坐标
 * @param {number} y - 中心Y坐标
 */
function createHexagon(scene, x, y) {
  const graphics = scene.add.graphics();
  
  // 青色 (Cyan)
  graphics.fillStyle(0x00ffff, 1);
  
  // 六边形半径（16像素直径，半径8像素）
  const radius = 8;
  
  // 计算六边形的6个顶点坐标
  const points = [];
  for (let i = 0; i < 6; i++) {
    // 六边形顶点角度：从30度开始，每60度一个顶点（使顶部平坦）
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push({ x: px, y: py });
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(points, true);
}

new Phaser.Game(config);