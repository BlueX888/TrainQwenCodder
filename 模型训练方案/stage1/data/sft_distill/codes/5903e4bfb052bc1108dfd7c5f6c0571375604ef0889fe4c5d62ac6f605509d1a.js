// 全局信号对象，用于验证状态
window.__signals__ = {
  loadingProgress: 0,
  loadingComplete: false,
  mainSceneStarted: false,
  timestamp: Date.now()
};

// LoadingScene - 预加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建进度条背景
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // 创建加载文本
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    // 创建百分比文本
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      // 绘制紫色进度条
      progressBar.clear();
      progressBar.fillStyle(0x8b00ff, 1); // 紫色
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      
      // 更新百分比文本
      percentText.setText(Math.floor(value * 100) + '%');
      
      // 更新全局信号
      window.__signals__.loadingProgress = value;
      
      console.log(JSON.stringify({
        event: 'loading_progress',
        progress: value,
        timestamp: Date.now()
      }));
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      window.__signals__.loadingComplete = true;
      
      console.log(JSON.stringify({
        event: 'loading_complete',
        timestamp: Date.now()
      }));
      
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 模拟加载资源 - 使用程序化生成纹理
    // 创建一些假的资源加载来展示进度条
    for (let i = 0; i < 10; i++) {
      // 使用 image 占位符模拟资源加载
      // 这里使用 base64 编码的 1x1 透明图片作为占位
      const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      this.load.image(`dummy${i}`, dummyImage);
    }

    // 添加一些延迟来让进度条更明显
    this.load.on('fileprogress', (file) => {
      // 可以在这里添加额外的逻辑
    });
  }

  create() {
    // 添加一个短暂延迟后切换场景，让用户看到 100% 的进度
    this.time.delayedCall(500, () => {
      console.log(JSON.stringify({
        event: 'switching_to_main_scene',
        timestamp: Date.now()
      }));
      
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  create() {
    window.__signals__.mainSceneStarted = true;
    
    console.log(JSON.stringify({
      event: 'main_scene_started',
      timestamp: Date.now()
    }));

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示标题
    const titleText = this.add.text(width / 2, height / 2 - 100, 'Loading Complete!', {
      font: 'bold 32px monospace',
      fill: '#00ff00'
    });
    titleText.setOrigin(0.5);

    // 显示提示信息
    const infoText = this.add.text(width / 2, height / 2, 'Main Scene is now active', {
      font: '20px monospace',
      fill: '#ffffff'
    });
    infoText.setOrigin(0.5);

    // 创建一些装饰性的图形元素
    const graphics = this.add.graphics();
    
    // 绘制一些紫色的装饰圆圈
    for (let i = 0; i < 5; i++) {
      const x = width / 2 + (i - 2) * 80;
      const y = height / 2 + 100;
      graphics.fillStyle(0x8b00ff, 0.6);
      graphics.fillCircle(x, y, 20);
    }

    // 添加一个脉冲动画效果
    this.tweens.add({
      targets: titleText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 显示最终状态信息
    const statusText = this.add.text(width / 2, height - 50, 
      'Check window.__signals__ for verification', {
      font: '14px monospace',
      fill: '#888888'
    });
    statusText.setOrigin(0.5);

    // 输出最终状态
    console.log(JSON.stringify({
      event: 'final_state',
      signals: window.__signals__,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 主场景的更新逻辑（如果需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene],
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始化信息
console.log(JSON.stringify({
  event: 'game_initialized',
  config: {
    width: config.width,
    height: config.height,
    scenes: ['LoadingScene', 'MainScene']
  },
  timestamp: Date.now()
}));