class FlashScene extends Phaser.Scene {
  constructor() {
    super('FlashScene');
    this.flashCount = 0; // 状态信号：闪烁次数
    this.flashComplete = false; // 状态信号：闪烁是否完成
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x222222, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // 创建一些游戏对象用于视觉效果
    const centerX = width / 2;
    const centerY = height / 2;

    // 绘制中心圆形
    const circleGraphics = this.add.graphics();
    circleGraphics.fillStyle(0x00ff00, 1);
    circleGraphics.fillCircle(centerX, centerY, 50);

    // 绘制四个角落的矩形
    const rectGraphics = this.add.graphics();
    rectGraphics.fillStyle(0xff0000, 1);
    rectGraphics.fillRect(50, 50, 80, 80);
    rectGraphics.fillRect(width - 130, 50, 80, 80);
    rectGraphics.fillRect(50, height - 130, 80, 80);
    rectGraphics.fillRect(width - 130, height - 130, 80, 80);

    // 添加文字提示
    const statusText = this.add.text(centerX, centerY + 100, 'Flashing...', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    });
    statusText.setOrigin(0.5);

    const countText = this.add.text(centerX, centerY + 140, `Flash Count: ${this.flashCount}`, {
      fontSize: '18px',
      color: '#ffff00',
      align: 'center'
    });
    countText.setOrigin(0.5);

    // 实现闪烁效果：在2秒内重复闪烁
    const flashDuration = 200; // 单次闪烁持续时间（毫秒）
    const flashInterval = 400; // 闪烁间隔（毫秒）
    const totalDuration = 2000; // 总持续时间（毫秒）
    const flashTimes = Math.floor(totalDuration / flashInterval); // 闪烁次数

    // 创建定时器，定期触发闪烁
    this.time.addEvent({
      delay: flashInterval,
      callback: () => {
        if (this.flashCount < flashTimes) {
          // 使用 camera.flash() 实现闪烁效果
          // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 强制效果, 回调
          this.cameras.main.flash(flashDuration, 255, 255, 255, false, (camera, progress) => {
            if (progress === 1) {
              this.flashCount++;
              countText.setText(`Flash Count: ${this.flashCount}`);
              
              // 检查是否完成所有闪烁
              if (this.flashCount >= flashTimes) {
                this.flashComplete = true;
                statusText.setText('Flash Complete!');
                statusText.setColor('#00ff00');
                
                console.log('Flash effect completed!');
                console.log('Total flashes:', this.flashCount);
                console.log('Flash complete status:', this.flashComplete);
              }
            }
          });
        }
      },
      repeat: flashTimes - 1,
      startAt: 0
    });

    // 添加鼠标点击事件，可以手动触发闪烁
    this.input.on('pointerdown', () => {
      if (this.flashComplete) {
        // 重置状态
        this.flashCount = 0;
        this.flashComplete = false;
        statusText.setText('Flashing...');
        statusText.setColor('#ffffff');
        countText.setText(`Flash Count: ${this.flashCount}`);
        
        // 重新启动场景
        this.scene.restart();
      }
    });

    // 添加提示文字
    const hintText = this.add.text(centerX, height - 40, 
      'Click to restart after flash completes', {
      fontSize: '14px',
      color: '#888888',
      align: 'center'
    });
    hintText.setOrigin(0.5);

    // 输出初始状态
    console.log('Scene started - Flash effect beginning');
    console.log('Initial flash count:', this.flashCount);
    console.log('Flash complete:', this.flashComplete);
  }

  update(time, delta) {
    // 可以在这里添加更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: FlashScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);