const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  objectsCreated: 0,
  animationsStarted: 0,
  animationsCompleted: 0,
  currentAlphaValues: [],
  status: 'initializing'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0x800080];
  
  // 创建8个不同颜色的矩形对象
  for (let i = 0; i < 8; i++) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(0, 0, 60, 60);
    
    // 生成纹理
    const textureName = `object${i}`;
    graphics.generateTexture(textureName, 60, 60);
    graphics.destroy();
    
    // 创建精灵
    const sprite = scene.add.sprite(100 + (i % 4) * 150, 200 + Math.floor(i / 4) * 150, textureName);
    sprite.setAlpha(0); // 初始透明度为0
    objects.push(sprite);
    
    window.__signals__.objectsCreated++;
  }
  
  console.log(JSON.stringify({
    event: 'objects_created',
    count: objects.length,
    timestamp: Date.now()
  }));
  
  // 创建同步的淡入淡出动画
  const tweens = objects.map(obj => ({
    targets: obj,
    alpha: 1,
    duration: 250, // 0.25秒淡入
    yoyo: true,    // 自动淡出
    ease: 'Linear'
  }));
  
  // 使用 addMultiple 同步启动所有动画
  const tweenGroup = scene.tweens.addMultiple(tweens);
  window.__signals__.animationsStarted = tweens.length;
  window.__signals__.status = 'animating';
  
  console.log(JSON.stringify({
    event: 'animations_started',
    count: tweens.length,
    duration: 500,
    timestamp: Date.now()
  }));
  
  // 监听第一个动画完成（所有动画同步，只需监听一个）
  if (tweenGroup.length > 0) {
    tweenGroup[0].on('complete', () => {
      window.__signals__.animationsCompleted = objects.length;
      window.__signals__.status = 'completed';
      
      // 记录最终的 alpha 值
      window.__signals__.currentAlphaValues = objects.map((obj, index) => ({
        objectIndex: index,
        alpha: obj.alpha
      }));
      
      console.log(JSON.stringify({
        event: 'animations_completed',
        finalAlphaValues: window.__signals__.currentAlphaValues,
        timestamp: Date.now()
      }));
      
      // 验证所有对象都回到透明状态
      const allTransparent = objects.every(obj => obj.alpha === 0);
      console.log(JSON.stringify({
        event: 'validation',
        allTransparent: allTransparent,
        expectedDuration: 500,
        status: 'success'
      }));
    });
  }
  
  // 添加文本提示
  const text = scene.add.text(400, 50, 'Fade In/Out Animation (0.5s)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // 实时更新当前 alpha 值（用于调试）
  if (window.__signals__.status === 'animating') {
    const scene = this;
    const sprites = scene.children.list.filter(child => child.type === 'Sprite');
    window.__signals__.currentAlphaValues = sprites.map((sprite, index) => ({
      objectIndex: index,
      alpha: parseFloat(sprite.alpha.toFixed(3))
    }));
  }
}

new Phaser.Game(config);