const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let cursors;
let shakeCount = 0;
let statusText;
let isShaking = false;
let lastShakeTime = 0;
let grid;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建网格背景作为抖动效果的参考
  grid = this.add.graphics();
  drawGrid.call(this);

  // 创建中心参考物体
  const centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0xff6b6b, 1);
  centerGraphics.fillCircle(400, 300, 40);
  centerGraphics.lineStyle(3, 0xffffff, 1);
  centerGraphics.strokeCircle(400, 300, 40);

  // 创建四个角落的参考方块
  createCornerBox.call(this, 50, 50, 0x4ecdc4);
  createCornerBox.call(this, 750, 50, 0xffe66d);
  createCornerBox.call(this, 50, 550, 0x95e1d3);
  createCornerBox.call(this, 750, 550, 0xf38181);

  // 创建状态显示文本
  statusText = this.add.text(400, 50, 'Shake Count: 0\nPress Arrow Keys to Shake Camera', {
    fontSize: '24px',
    fill: '#ffffff',
    align: 'center',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  statusText.setOrigin(0.5, 0);
  statusText.setScrollFactor(0); // 固定在屏幕上，不受相机影响

  // 创建提示文本
  const hintText = this.add.text(400, 550, '↑ ↓ ← → Arrow Keys', {
    fontSize: '20px',
    fill: '#aaaaaa',
    align: 'center'
  });
  hintText.setOrigin(0.5, 0.5);
  hintText.setScrollFactor(0);

  // 初始化键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 监听相机抖动完成事件
  this.cameras.main.on('camerashakecomplete', () => {
    isShaking = false;
  });
}

function update(time, delta) {
  // 防止连续触发，设置冷却时间（100ms）
  const canShake = !isShaking && (time - lastShakeTime > 100);

  if (canShake) {
    // 检测任意方向键按下
    if (cursors.up.isDown || cursors.down.isDown || 
        cursors.left.isDown || cursors.right.isDown) {
      
      // 触发相机抖动
      // 参数：持续时间(ms), 强度, 是否强制, 回调, 上下文
      this.cameras.main.shake(500, 0.01);
      
      // 更新状态
      isShaking = true;
      lastShakeTime = time;
      shakeCount++;
      
      // 更新显示文本
      statusText.setText(`Shake Count: ${shakeCount}\nPress Arrow Keys to Shake Camera`);
      
      // 在控制台输出验证信息
      console.log(`Camera shake triggered! Count: ${shakeCount}`);
    }
  }
}

// 辅助函数：绘制网格
function drawGrid() {
  grid.clear();
  grid.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 800; x += 50) {
    grid.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 600; y += 50) {
    grid.lineBetween(0, y, 800, y);
  }
}

// 辅助函数：创建角落参考方块
function createCornerBox(x, y, color) {
  const box = this.add.graphics();
  box.fillStyle(color, 1);
  box.fillRect(x - 25, y - 25, 50, 50);
  box.lineStyle(2, 0xffffff, 1);
  box.strokeRect(x - 25, y - 25, 50, 50);
}

new Phaser.Game(config);