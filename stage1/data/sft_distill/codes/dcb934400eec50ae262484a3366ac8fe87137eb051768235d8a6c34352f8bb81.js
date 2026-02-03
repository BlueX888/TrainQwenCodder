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
    this.progressBar = null;
    this.progressBox = null;
    this.loadingText = null;
    this.percentText = null;
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建进度条背景框（深灰色）
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // 创建进度条填充（青色）
    this.progressBar = this.add.graphics();

    // 创建加载文本
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    this.loadingText.setOrigin(0.5, 0.5);

    // 创建百分比文本
    this.percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });
    this.percentText.setOrigin(0.5, 0.5);

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      // 更新全局信号
      window.__signals__.loadingProgress = Math.floor(value * 100);
      
      // 更新进度条（青色 #00CED1）
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00CED1, 1);
      this.progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);

      // 更新百分比文本
      this.percentText.setText(Math.floor(value * 100) + '%');

      // 输出日志
      console.log(JSON.stringify({
        event: 'loading_progress',
        progress: Math.floor(value * 100),
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

      // 延迟500ms后切换场景，让用户看到100%
      this.time.delayedCall(500, () => {
        this.scene.start('MainScene');
      });
    });

    // 模拟加载资源 - 创建一些假的纹理资源
    // 使用Graphics生成纹理，模拟资源加载
    for (let i = 0; i < 10; i++) {
      this.load.image(`asset_${i}`, this.createDummyTexture(i));
    }

    // 添加一些延迟以展示进度效果
    this.load.on('fileprogress', (file) => {
      console.log(JSON.stringify({
        event: 'file_progress',
        file: file.key,
        timestamp: Date.now()
      }));
    });
  }

  // 创建虚拟纹理数据URL（模拟资源加载）
  createDummyTexture(index) {
    // 创建一个简单的canvas纹理
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // 绘制不同颜色的方块
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
                    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#AAB7B8'];
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(0, 0, 64, 64);
    
    return canvas.toDataURL();
  }

  create() {
    // create方法在preload完成后自动调用
    // 这里不需要额外操作，场景切换在load complete事件中处理
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0;
    this.level = 1;
  }

  create() {
    // 更新全局信号
    window.__signals__.mainSceneStarted = true;
    window.__signals__.score = this.score;
    window.__signals__.level = this.level;

    console.log(JSON.stringify({
      event: 'main_scene_started',
      score: this.score,
      level: this.level,
      timestamp: Date.now()
    }));

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#2C3E50');

    // 显示加载完成标题
    const titleText = this.add.text(width / 2, height / 2 - 100, 'Loading Complete!', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#00CED1',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5, 0.5);

    // 显示欢迎信息
    const welcomeText = this.add.text(width / 2, height / 2, 'Welcome to Main Scene', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ECF0F1'
    });
    welcomeText.setOrigin(0.5, 0.5);

    // 显示状态信息
    const statusText = this.add.text(width / 2, height / 2 + 60, 
      `Level: ${this.level} | Score: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#BDC3C7'
    });
    statusText.setOrigin(0.5, 0.5);

    // 使用Graphics绘制装饰元素
    const graphics = this.add.graphics();
    
    // 绘制青色装饰线条
    graphics.lineStyle(4, 0x00CED1, 1);
    graphics.strokeRect(width / 2 - 250, height / 2 - 150, 500, 250);
    
    // 绘制四个角的装饰
    graphics.fillStyle(0x00CED1, 1);
    graphics.fillCircle(width / 2 - 250, height / 2 - 150, 8);
    graphics.fillCircle(width / 2 + 250, height / 2 - 150, 8);
    graphics.fillCircle(width / 2 - 250, height / 2 + 100, 8);
    graphics.fillCircle(width / 2 + 250, height / 2 + 100, 8);

    // 添加提示文本
    const hintText = this.add.text(width / 2, height - 50, 
      'All resources loaded successfully', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#95A5A6',
      fontStyle: 'italic'
    });
    hintText.setOrigin(0.5, 0.5);

    // 创建一个简单的动画效果
    this.tweens.add({
      targets: titleText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 模拟游戏逻辑 - 每秒增加分数
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += 10;
        window.__signals__.score = this.score;
        statusText.setText(`Level: ${this.level} | Score: ${this.score}`);
        
        console.log(JSON.stringify({
          event: 'score_update',
          score: this.score,
          timestamp: Date.now()
        }));

        // 每100分升级
        if (this.score % 100 === 0 && this.score > 0) {
          this.level++;
          window.__signals__.level = this.level;
          
          console.log(JSON.stringify({
            event: 'level_up',
            level: this.level,
            timestamp: Date.now()
          }));
        }
      },
      loop: true
    });
  }
}

// Phaser Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene],  // 场景数组，第一个场景自动启动
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始化信号
console.log(JSON.stringify({
  event: 'game_initialized',
  config: {
    width: config.width,
    height: config.height,
    scenes: ['LoadingScene', 'MainScene']
  },
  timestamp: Date.now()
}));