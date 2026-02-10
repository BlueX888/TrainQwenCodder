// 全局信号记录
window.__signals__ = {
  loadingProgress: 0,
  loadingComplete: false,
  mainSceneStarted: false,
  timestamp: Date.now()
};

// LoadingScene - 资源加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建进度条背景（深紫色）
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x4a148c, 1);
    progressBarBg.fillRect(width / 2 - 200, height / 2 - 25, 400, 50);

    // 创建进度条填充（亮紫色）
    const progressBar = this.add.graphics();

    // 添加加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 60, 'Loading...', {
      fontSize: '24px',
      color: '#9c27b0',
      fontFamily: 'Arial'
    });
    loadingText.setOrigin(0.5);

    // 百分比文本
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    percentText.setOrigin(0.5);

    // 监听加载进度
    this.load.on('progress', (value) => {
      // 更新进度条
      progressBar.clear();
      progressBar.fillStyle(0xce93d8, 1);
      progressBar.fillRect(width / 2 - 200, height / 2 - 25, 400 * value, 50);

      // 更新百分比文本
      const percent = Math.floor(value * 100);
      percentText.setText(percent + '%');

      // 记录信号
      window.__signals__.loadingProgress = value;
      console.log(JSON.stringify({
        event: 'loading_progress',
        progress: value,
        percent: percent,
        timestamp: Date.now()
      }));
    });

    // 监听加载完成
    this.load.on('complete', () => {
      window.__signals__.loadingComplete = true;
      console.log(JSON.stringify({
        event: 'loading_complete',
        timestamp: Date.now()
      }));
    });

    // 模拟加载一些资源（使用程序化生成的纹理）
    // 创建假的加载任务来展示进度条效果
    for (let i = 0; i < 10; i++) {
      // 使用data uri模拟资源加载
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = `hsl(${i * 36}, 70%, 50%)`;
      ctx.fillRect(0, 0, 32, 32);
      
      this.load.image(`asset_${i}`, canvas.toDataURL());
    }
  }

  create() {
    // 添加延迟以便看到100%的进度条
    this.time.delayedCall(500, () => {
      console.log(JSON.stringify({
        event: 'switching_to_main_scene',
        timestamp: Date.now()
      }));
      
      // 切换到主场景
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

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示成功加载的消息
    const successText = this.add.text(width / 2, height / 2 - 100, 'Loading Complete!', {
      fontSize: '36px',
      color: '#ce93d8',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    successText.setOrigin(0.5);

    // 显示已加载的资源
    const assetsText = this.add.text(width / 2, height / 2 - 40, 'Assets Loaded: 10', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    assetsText.setOrigin(0.5);

    // 显示加载的资源图标
    let xPos = width / 2 - 180;
    const yPos = height / 2 + 40;
    
    for (let i = 0; i < 10; i++) {
      const sprite = this.add.image(xPos, yPos, `asset_${i}`);
      sprite.setScale(1.5);
      
      // 添加简单的浮动动画
      this.tweens.add({
        targets: sprite,
        y: yPos - 10,
        duration: 1000 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      xPos += 40;
    }

    // 提示信息
    const hintText = this.add.text(width / 2, height - 50, 'Main Scene Ready', {
      fontSize: '18px',
      color: '#9c27b0',
      fontFamily: 'Arial'
    });
    hintText.setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'main_scene_created',
      timestamp: Date.now(),
      signals: window.__signals__
    }));

    // 添加闪烁效果
    this.tweens.add({
      targets: hintText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(time, delta) {
    // 主场景更新逻辑（如果需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0f0f1e',
  scene: [LoadingScene, MainScene],
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出最终验证信号
setTimeout(() => {
  console.log(JSON.stringify({
    event: 'final_verification',
    signals: window.__signals__,
    expected: {
      loadingProgress: 1,
      loadingComplete: true,
      mainSceneStarted: true
    }
  }));
}, 3000);