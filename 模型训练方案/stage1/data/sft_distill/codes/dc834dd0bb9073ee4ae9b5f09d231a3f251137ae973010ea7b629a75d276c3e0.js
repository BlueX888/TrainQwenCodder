const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态信号：记录闪烁触发次数
let flashCount = 0;
let flashText;
let instructionText;
let statusText;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 获取主相机
  const camera = this.cameras.main;
  
  // 绘制背景图形，便于观察闪烁效果
  const graphics = this.add.graphics();
  graphics.fillStyle(0x1a1a1a, 1);
  graphics.fillRect(0, 0, 800, 600);
  
  // 添加一些装饰性图形
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillCircle(200, 200, 80);
  
  graphics.fillStyle(0xe24a4a, 1);
  graphics.fillCircle(600, 400, 60);
  
  graphics.fillStyle(0x4ae290, 1);
  graphics.fillRect(350, 250, 100, 100);
  
  // 创建提示文本
  instructionText = this.add.text(400, 100, '点击鼠标左键触发相机闪烁', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);
  
  // 创建闪烁次数显示文本
  flashText = this.add.text(400, 150, `闪烁次数: ${flashCount}`, {
    fontSize: '20px',
    color: '#ffff00',
    fontFamily: 'Arial'
  });
  flashText.setOrigin(0.5);
  
  // 创建状态文本
  statusText = this.add.text(400, 500, '等待点击...', {
    fontSize: '18px',
    color: '#00ff00',
    fontFamily: 'Arial'
  });
  statusText.setOrigin(0.5);
  
  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    // 检查是否为左键（button === 0）
    if (pointer.leftButtonDown()) {
      // 触发相机闪烁效果
      // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 是否强制, 回调函数
      camera.flash(4000, 255, 255, 255, false, (cam, progress) => {
        if (progress === 1) {
          // 闪烁完成
          statusText.setText('闪烁完成！等待下次点击...');
          statusText.setColor('#00ff00');
        }
      });
      
      // 更新状态
      flashCount++;
      flashText.setText(`闪烁次数: ${flashCount}`);
      statusText.setText('闪烁中... (4秒)');
      statusText.setColor('#ff9900');
      
      // 在控制台输出验证信息
      console.log(`触发闪烁 #${flashCount} - 持续4秒`);
    }
  });
  
  // 添加鼠标悬停效果提示
  this.input.on('pointermove', (pointer) => {
    instructionText.setColor('#ffff00');
  });
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供外部验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getFlashCount: () => flashCount };
}